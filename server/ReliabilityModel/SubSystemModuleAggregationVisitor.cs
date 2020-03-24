using System.Collections.Generic;
using System.Linq;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Model
{
    public class SubSystemModuleAggregationVisitor
    {
        public IReadOnlyList<SingleModuleSystem> VisitSubSystem(System.System system)
        {
            var allSingleModules = new List<SingleModuleSystem>();

            AggregateModules(allSingleModules, system);

            return allSingleModules;
        }

        private static void AggregateModules(List<SingleModuleSystem> allSingleModules, System.System system)
        {
            switch (system)
            {
                case MultipleModuleSystem multipleModuleSubSystem:
                    {
                        IEnumerable<SingleModuleSystem> singleModules = multipleModuleSubSystem.SubSystems.OfType<SingleModuleSystem>();
                        allSingleModules.AddRange(singleModules);

                        IEnumerable<MultipleModuleSystem> multipleModuleSubSystems =
                            multipleModuleSubSystem.SubSystems.OfType<MultipleModuleSystem>();

                        foreach (MultipleModuleSystem moduleSubSystem in multipleModuleSubSystems)
                        {
                            AggregateModules(allSingleModules, moduleSubSystem);
                        }

                        break;
                    }
                case SingleModuleSystem singleModule:
                    allSingleModules.Add(singleModule);
                    break;
            }
        }
    }
}