﻿using ReliabilityModel.Model;
using System;
using System.Linq;
using System.Text;

namespace ReliabilityModel.Model.Formatters
{
    public abstract class GraphFormatter
    {
        private readonly StateFilteringStrategy _stateFilteringStrategy;

        private readonly Func<SystemState, string> _representation;

        protected GraphFormatter(StateFilteringStrategy stateFilteringStrategy, Func<SystemState, string> representation)
        {
            _representation = representation;
            _stateFilteringStrategy = stateFilteringStrategy;
        }

        public string ToString(SystemStateGraph stateGraph)
        {
            var stringBuilder = new StringBuilder();

            foreach (PossibleTransitions transition in stateGraph.Transitions)
            {
                if (!_stateFilteringStrategy.IncludeState(transition.SystemState))
                {
                    continue;
                }

                stringBuilder.Append(_representation(transition.SystemState));
                stringBuilder.Append(" -> ");

                const string delimiter = ", ";
                foreach (SystemState toSystemState in transition.ToSystemStates)
                {
                    stringBuilder.Append(_representation(toSystemState));
                    stringBuilder.Append(delimiter);
                }

                if (transition.ToSystemStates.Any())
                {
                    stringBuilder.Remove(stringBuilder.Length - delimiter.Length, delimiter.Length);
                }

                stringBuilder.AppendLine();
            }

            return stringBuilder.ToString();
        }

        protected static string GetStateSuffix(SystemState systemState)
        {
            if (systemState.IsTerminal)
            {
                return "!";
            }

            if (systemState.IsWorking)
            {
                return string.Empty;
            }

            if (systemState.IsWaitingRecovery)
            {
                return "?";
            }

            throw new ArgumentException();
        }
    }
}