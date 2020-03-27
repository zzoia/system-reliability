using System.Collections.Generic;
using System.Linq;
using Microsoft.Research.Oslo;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Model
{
    public class SystemStateGraph
    {
        private readonly MultipleModuleSystem _system;

        private readonly IList<SystemState> _allPossibleStates;

        public SystemStateGraph(MultipleModuleSystem system)
        {
            _system = system;

            _allPossibleStates = GetAllPossibleStates();
            Transitions = GetPossibleTransitions();
        }

        public IReadOnlyList<SystemState> AllPossibleStates => (IReadOnlyList<SystemState>)_allPossibleStates;

        public IReadOnlyList<PossibleTransitions> Transitions { get; }

        private IReadOnlyList<PossibleTransitions> GetPossibleTransitions()
        {
            var transitions = new List<PossibleTransitions>();

            foreach (SystemState fromState in AllPossibleStates)
            {
                var transition = new PossibleTransitions(fromState);

                foreach (SystemState toState in AllPossibleStates)
                {
                    bool canTransitTo = fromState.GetTransitionRate(toState, out double rate, out bool isRecovering);
                    if (canTransitTo)
                    {
                        transition.ToSystemStates.Add(new SystemStateTransition
                        {
                            ToSystemState = toState,
                            IsRecovering = isRecovering,
                            WithRate = rate
                        });
                    }
                }

                transitions.Add(transition);
            }

            return transitions;
        }

        public double[,] BuildWeightMatrix()
        {
            var equations = new double[AllPossibleStates.Count, AllPossibleStates.Count];
            for (var fromStateIdx = 0; fromStateIdx < AllPossibleStates.Count; fromStateIdx++)
            {
                SystemState currentState = AllPossibleStates[fromStateIdx];

                PossibleTransitions transitionsForState = Transitions
                    .SingleOrDefault(transition => transition.SystemState == currentState);

                if (transitionsForState == null)
                {
                    continue;
                }

                foreach (SystemStateTransition nextState in transitionsForState.ToSystemStates)
                {
                    int toStateIdx = _allPossibleStates.IndexOf(nextState.ToSystemState);

                    equations[fromStateIdx, toStateIdx] -= nextState.WithRate;
                    equations[toStateIdx, fromStateIdx] += nextState.WithRate;
                }
            }

            return equations;
        }

        public IReadOnlyList<WorkingProbability> GetProbability(double from, double to, double step)
        {
            double[,] equations = BuildWeightMatrix();

            var initial = new Vector(Enumerable.Repeat(1.0, AllPossibleStates.Count).ToArray());
            var solution = Ode.RK547M(0, initial, (_, vector) =>
            {
                double[] result = new double[vector.Length];
                for (var state = 0; state < result.Length; state++)
                {
                    result[state] = 0;
                    for (var component = 0; component < result.Length; component++)
                    {
                        result[state] += equations[state, component];
                    }
                }
                return new Vector(result);
            });

            int[] workingIndices = AllPossibleStates
                .Select((state, index) => new { index, state.IsWorking })
                .Where(state => state.IsWorking)
                .Select(state => state.index)
                .ToArray();

            var points = solution.SolveFromToStep(from, to, step).ToArray();
            return points.Select(point => new WorkingProbability
            {
                Time = point.T,
                AggregatedProbability = point.X.ToArray().Where((_, index) => workingIndices.Contains(index)).Sum()
            }).ToList();
        }

        private IList<SystemState> GetAllPossibleStates()
        {
            IReadOnlyList<SingleModuleSystem> singleModules = new SubSystemModuleAggregationVisitor().VisitSubSystem(_system);

            IReadOnlyList<IReadOnlyList<ModuleState>> modulesStates = singleModules
                .Select(singleModuleSystem => singleModuleSystem.GetModuleStates())
                .ToList();

            int[] maxValues = modulesStates.Select(list => list.Count - 1).ToArray();
            var systemStates = new List<int[]>
            {
                Enumerable.Repeat(0, maxValues.Length).ToArray()
            };

            var integerOperator = new IntegerSetOperator(maxValues);
            while (!integerOperator.IsMax(systemStates.Last()))
            {
                systemStates.Add(integerOperator.Increment(systemStates.Last()));
            }

            return systemStates
                .Select((indices, index) => SystemState.FromModuleStatesIndices(_system, indices, modulesStates, index))
                .ToList();
        }
    }
}